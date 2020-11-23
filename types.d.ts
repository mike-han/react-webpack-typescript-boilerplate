import {
  QuillOptionsStatic,
  RangeStatic,
  BoundsStatic,
  Sources
} from 'quill'
import Delta = require('quill-delta');

// Merged namespace hack to export types along with default object
// See: https://github.com/Microsoft/TypeScript/issues/2719

export type DeltaStatic = Delta;
export type Value = string | DeltaStatic;
export type Range = RangeStatic | null;

/**
 * Changes to these properties cause the editor instance to be recreated
 * [Quill options documentation](https://quilljs.com/docs/configuration/).
 *
 * Note: We will use object.is to compare these values. When any value changes, the editor instance is recreated
 * So, unless you want the editor instance to be recreated, keep the same reference for these props
 *
 * Note2: If you want to control whether the editor is recreated or not by yourself, you can use the function `checkeditoroption`
 */
export type QuillDirectOptions = Omit<QuillOptionsStatic, 'debug', 'placeholder', 'strict'> & {
  /**
   * If true, a pre tag is used for the editor area instead of the default div tag. This prevents editor from collapsing continuous whitespaces on paste.
   */
  preserveWhitespace?: boolean;
}

export type QuillOptions = QuillDirectOptions & QuillOptionsStatic & {
  tabIndex?: number
}

export type ReactEditorProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  defaultValue?: Value,
  value?: Value,
  onChange?(
    value: string,
    delta: DeltaStatic,
    source: Sources,
    editor: UnprivilegedEditor,
  ): void,
  onSelectionChange?(
    selection: Range,
    source: Sources,
    editor: UnprivilegedEditor,
  ): void,
  onFocus?(
    selection: Range,
    source: Sources,
    editor: UnprivilegedEditor,
  ): void,
  onBlur?(
    previousSelection: Range,
    source: Sources,
    editor: UnprivilegedEditor,
  ): void,
  /**
  * Set ability for user to edit, via input devices like the mouse or keyboard.
  * Does not affect capabilities of API calls, when the source is "api" or “silent”.
  *
  * Note: When readOnly is true, this property is not valid
  */
  enabled?: boolean,
  autoFocus?: boolean,
  /**
   * A ref that points to the used editor instance.
   */
  editorRef?: React.MutableRefObject<Quill> | ((quill: Quill) => void)
} & QuillOptions;

export interface UnprivilegedEditor {
  getLength(): number;
  getText(index?: number, length?: number): string;
  getHTML(): string;
  getBounds(index: number, length?: number): BoundsStatic;
  getSelection(focus?: boolean): RangeStatic;
  getContents(index?: number, length?: number): DeltaStatic;
}
