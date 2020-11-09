import React from 'react';

interface Props {
  pre: boolean;
}

export const EditingArea = React.forwardRef((props: Props, ref: React.RefObject<any>) => {
  const { pre } = props;
  const Tag = !pre ? 'div' : 'pre';
  return <><Tag data-testid="editing-area" ref={ref}></Tag></>;
})
