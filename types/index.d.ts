import React from 'react';
import { EdiotrValue, Editor, DeltaValue, Sources, UnprivilegedEditor, RichSelection } from './type';
export declare type CheckEditorOption = (options?: EditorOptions) => boolean;
export interface EditorOptions {
    bounds?: HTMLElement | string;
    formats?: string[];
    modules?: {
        [x: string]: any;
    };
    editorTheme?: 'snow' | 'bubble';
    scrollingContainer?: HTMLElement | string;
    preserveWhitespace?: boolean;
    placeholder?: string;
    readOnly?: boolean;
}
export interface EditorPorps {
    enabled?: boolean;
    tabIndex?: number;
}
interface _ReactEditorProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    value?: EdiotrValue;
    defaultValue?: any;
    children?: never;
    onChange?: (value: EdiotrValue, delta: DeltaValue, source: Sources, editor: UnprivilegedEditor) => any;
    onSelectionChange?: (nextSelection: RichSelection, source: Sources, editor: UnprivilegedEditor) => any;
    onEditorFocus?: (nextSelection: RichSelection, source: Sources, editor: UnprivilegedEditor) => any;
    onEditorBlur?: (nextSelection: RichSelection, source: Sources, editor: UnprivilegedEditor) => any;
    checkEditorOption?: CheckEditorOption;
    editorRef?: React.MutableRefObject<Editor> | ((editor: Editor) => void);
    autoFocus?: boolean;
}
export declare type ReactEditorProps = _ReactEditorProps & EditorOptions & EditorPorps;
declare const ReactEditor: React.ForwardRefExoticComponent<_ReactEditorProps & EditorOptions & EditorPorps & React.RefAttributes<HTMLElement>>;
export default ReactEditor;
