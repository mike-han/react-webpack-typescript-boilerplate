import { render } from '@testing-library/react'
import React from 'react'
import ReactEditor from '../index'
describe('<ReactEditor />', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ReactEditor name='foo' />)
    expect(getByText(/foo/)).toBeInTheDocument()
  })
})
