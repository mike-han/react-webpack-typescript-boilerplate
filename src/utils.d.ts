import { DeltaValue, EdiotrValue, Editor, RichSelection, Sources, UnprivilegedEditor } from "./type";
export declare type RefValue<T> = React.RefObject<T> | React.MutableRefObject<T> | ((e: T) => void);
export declare const setRef: (ref: any, value: any) => void;
export declare const useRefValue: <T extends unknown>(value: T) => import("react").MutableRefObject<T>;
/**
  * This will create a new function if the ref props change and are defined.
  */
export declare const useForkRef: <T>(refA: RefValue<T>, refB: RefValue<T>) => (refValue: any) => void;
/**
 * Receives a ref, returns a ref and a callback function to assign values to both refs
 * @param ref
 */
export declare const useForwardRef: <T extends unknown>(ref: RefValue<T>) => [import("react").RefObject<T>, (arg0: T) => void];
/**
 * Receives a ref, return a callback function to assign val to ref and setVal
 * @param ref
 */
export declare const useForwardValueRef: <T>(ref: RefValue<T>) => [T, (e: T) => void];
/**
 * Returns true if component is just mounted (on first render) and false otherwise.
 */
export declare const useFirstMountState: () => boolean;
/**
 * React effect hook that ignores the first invocation (e.g. on mount).
 * The signature is exactly the same as the useEffect hook.
 *
 * @param effect
 * @param deps
 */
export declare const useUpdateEffect: (effect: () => any, deps: any) => void;
export declare const setEditorReadOnly: (editor: Editor, value: boolean) => void;
export declare const setEditorContents: (editor: Editor, value: EdiotrValue, source?: Sources) => void;
export declare const setEditorCursorEnd: (editor: Editor, source?: Sources) => void;
export declare const setEditorContentSelection: (editor: Editor, source?: Sources) => void;
export declare const setEditorSelection: (editor: Editor, range: RichSelection, source?: Sources) => void;
export declare const setEditorTabIndex: (editor: Editor, tabIndex: number) => void;
export declare const makeUnprivilegedEditor: (editor: Editor) => UnprivilegedEditor;
export declare const isDelta: (value: any) => boolean;
export declare const isDeltaEqual: (prve: DeltaValue, next: DeltaValue) => boolean;
export declare const isEditorValueEqual: (prve: EdiotrValue, next: EdiotrValue) => boolean;
