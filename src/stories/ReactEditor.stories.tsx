import React from 'react';
import ReacteEditor from '../index';
import { Meta, Story } from '@storybook/react/types-6-0';
import { ReactEditorProps } from '../../types';

export default {
  component: ReacteEditor,
  title: 'CSF/ReacteEditor'
} as Meta;

const Template: Story<ReactEditorProps> = (args) => <ReacteEditor {...args} />;

export const Basic = Template.bind({});
Basic.args = {
  defaultValue: '<i>This is the defaultValue</i>',
  enabled: true
}
