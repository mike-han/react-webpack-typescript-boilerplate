import React from 'react';
import { ReactEditor } from '../index';
import { ReactEditorProps } from '../../types';
import { Meta, Story } from '@storybook/react'

export default {
  component: ReactEditor,
  title: 'CSF/ReactEditor'
} as Meta;

const Template: Story<ReactEditorProps> = (args) => <ReactEditor {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  defaultValue: '<i>This is the defaultValue</i>',
  enabled: true
}
