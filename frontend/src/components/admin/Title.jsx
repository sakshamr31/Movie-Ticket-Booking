import React from 'react'

const Title = ({ text1, text2 }) => {
  return (
    <h1 className='font-medium text-2xl bg-blue-200 inline-block px-3 py-1 rounded-lg text-red-600 shadow-[0_-4px_6px_-1px_rgba(255,255,255,0.4),0_4px_6px_-1px_rgba(255,255,255,0.4)]'>
        {text1} {text2}
    </h1>
  )
}

export default Title