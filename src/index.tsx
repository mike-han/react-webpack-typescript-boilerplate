import React from 'react'

const ReactEditor = ({ name }: { name: string }): JSX.Element => {
  return <div className='hello'>Hey {name}, say hello to TypeScript.</div>
}

export default ReactEditor
