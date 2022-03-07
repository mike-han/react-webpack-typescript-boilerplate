import * as React from 'react';
import { isEqual } from 'lodash-es';
import Quill, { Sources } from 'quill';
import {
  isDelta, isEditorValueEqual, makeUnprivilegedEditor, setEditorContents, setEditorCursorEnd, useForwardRef, useForwardValueRef, useUpdateEffect
} from './utils';
import { Value, Range, DeltaStatic, QuillDirectOptions, ReactEditorProps, UnprivilegedEditor, EventType } from '../types';
const { useEffect, useRef, useState } = React;

/**
 * When the rich text editor instance is recreated, clear the DOM generated by the `toolbar` module
 *
 * Note: The location of the toolbar node does not have an explicit interface, so if quill.js version upgrade, we need to modify this method
 * @param root
 */
const clearToolbarNode = (root: HTMLElement) => {
  const toolbar = root?.previousElementSibling;
  if (toolbar?.classList.contains('ql-toolbar')) {
    root.parentElement?.removeChild(toolbar);
  }
  const tooltip = root.getElementsByClassName('ql-tooltip')?.[0];
  if (tooltip?.classList.contains('ql-tooltip')) {
    root.removeChild(tooltip);
  }
};

/**
 * Changing these parameters will change the `version`,
 * Changing the `version` will recreate the editor instance.
 * [Quill options documentation](https://quilljs.com/docs/configuration/).
 * @param options
 */
const useVersion = ({ readOnly, modules, formats, bounds, theme, scrollingContainer, preserveWhitespace }: QuillDirectOptions, initVersion = 0 as number): number => {
  const prevFormatsRef = useRef(formats);
  const [version, setVersion] = useState(initVersion);

  useUpdateEffect(() => {
    setVersion(version + 1);
  }, [readOnly, modules, bounds, theme, scrollingContainer, preserveWhitespace]);

  useUpdateEffect(() => {
    const regenerate = !isEqual(prevFormatsRef.current, formats);
    if (regenerate) {
      setVersion(version + 1);
    }
    prevFormatsRef.current = formats;
  }, [formats]);

  return version;
};

/**
 * The Quill editor instance.
 */
export const ReactEditor = (props: ReactEditorProps) => {
  const {
    bounds,
    formats,
    modules,
    theme,
    scrollingContainer,
    preserveWhitespace,
    enabled,
    placeholder,
    readOnly,
    value: propValue,
    defaultValue,
    children,
    onChange,
    onSelectionChange,
    onFocus,
    onBlur,
    editorRef,
    autoFocus,
    ...others
  } = props;

  const [elRef, handleRef] = useForwardRef<HTMLElement>({current: null});
  const [editor, setEditor] = useForwardValueRef<Quill>(editorRef);
  const value = typeof propValue !== 'undefined' ? propValue : defaultValue;

  // When the prop affecting the instance change, the recalculation version is used to update the instance
  const version = useVersion({ readOnly, modules, formats, bounds, theme, scrollingContainer, preserveWhitespace });
  // Cache delta and section to restore them after the instance is recreated
  const prevDeltaSelectionRef = useRef({ delta: null, selection: null });

  // When the version changes, recreate the editor instance
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const { delta, selection } = prevDeltaSelectionRef.current;
    const editor = new Quill(el, {
      readOnly, modules, formats, bounds, theme: theme, scrollingContainer, placeholder
    }) as unknown as Quill;
    // If delta exists, it means that the editor was not created for the first time. We need to restore the original delta back.
    if (delta) {
      setEditorContents(editor, delta);
    } else {
      // If not exist, it means that the editor was created for the first time, we need to reset the value
      setEditorContents(editor, value);
    }
    // Restore selection
    if (selection) {
      editor.setSelection(selection);
      editor.focus();
    } else if (autoFocus) {
      setEditorCursorEnd(editor, 'silent');
      editor.focus();
    } else {
      editor.blur();
    }

    setEditor(editor);
    return () => {
      const delta = editor.getContents();
      const selection = editor.getSelection();
      prevDeltaSelectionRef.current = { delta, selection };
      setEditor(null);
      clearToolbarNode(el);
    };
    // Recreate the editor instance only version has changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const selectionRef = useRef<Range>(null);
  const valueRef = useRef<Value>(value);
  const deltaRef = useRef<DeltaStatic>(null);

  // When the editor instance is rebuilt, re register the related events
  useEffect(() => {
    if (!editor) return;
    const unprivilegedEditor = makeUnprivilegedEditor(editor);

    const changeText = (_: Value, delta: DeltaStatic, source: Sources, editor: UnprivilegedEditor) => {
      // We keep storing the same type of value as what the user gives us,
      // so that value comparisons will be more stable and predictable.
      const value = isDelta(valueRef.current) ? editor.getContents() : editor.getHTML();

      if (!isEditorValueEqual(value, valueRef.current)) {
        // Taint `delta` object, so we can recognize whether the user
        // is trying to send it back as `value`, preventing a likely loop.
        deltaRef.current = delta;
        // Taint `value` object
        valueRef.current = value;
        onChange?.(value, delta, source, editor);
      }
    };

    const changeSelection = (selection: Range, source: Sources, editor: UnprivilegedEditor) => {
      const { current: lastSelection } = selectionRef;
      if (isEqual(selection, lastSelection)) {
        return;
      }
      const hasGainedFocus = !lastSelection && selection;
      const hasLostFocus = lastSelection && !selection;
      selectionRef.current = selection;

      onSelectionChange?.(selection, source, editor);

      if (hasGainedFocus) {
        onFocus?.(selection, source, editor);
      } else if (hasLostFocus) {
        onBlur?.(lastSelection, source, editor);
      }
    };

    editor.on('editor-change', (eventType: EventType, rangeOrDelta: Range | DeltaStatic, _: any, source: Sources) => {
      if (eventType === 'selection-change') {
        changeSelection(rangeOrDelta as Range, source, unprivilegedEditor);
      }
      if (eventType === 'text-change') {
        changeText(editor.root.innerHTML, rangeOrDelta as DeltaStatic, source, unprivilegedEditor);
        changeSelection(editor.getSelection(), source, unprivilegedEditor);
      }
    });
    return () => {
      if (!editor) return;
      editor.off('editor-change');
    };
    // Re register event only editor instance has changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // Seeing that Quill is missing a way to prevent edits, we have to settle for a hybrid between controlled and uncontrolled mode.
  // We can't prevent the change, but we'll still override content whenever `value` differs from current state.
  useEffect(() => {
    const { current: prveValue } = valueRef;
    const { current: delta } = deltaRef;
    if (!editor) return;
    if (typeof value !== 'undefined') {
      if (value && value === delta) {
        throw new Error(
          'You are passing the `delta` object from the `onChange` event back ' +
          'as `value`. You most probably want `editor.getContents()` instead'
        );
      }

      // When porpValue changes, set it to editor
      // NOTE: Comparing an HTML string and a Quill Delta will always trigger a change, regardless of whether they represent the same document.
      if (!isEditorValueEqual(value, prveValue)) {
        setEditorContents(editor, value);
      }
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor || readOnly === true) return;

    if (typeof enabled !== 'undefined') {
      editor.enable(enabled);
    }
    if (enabled && autoFocus) {
      setEditorCursorEnd(editor);
      editor.focus();
    }
  }, [editor, readOnly, enabled, autoFocus]);

  useEffect(() => {
    if (!editor) return;
    editor.root.setAttribute('data-placeholder', placeholder || '');
  }, [editor, placeholder]);

  const Tag = !preserveWhitespace ? 'div' : 'pre';

  return (
    <div
      role="textbox"
      data-testid="rich-editor-core"
      data-version={version}
      {...others}
    >
      <><Tag data-testid="editing-area" ref={handleRef} /></>
    </div>
  );
}

export default ReactEditor;
