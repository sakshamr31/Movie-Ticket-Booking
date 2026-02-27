import React from 'react'
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'

const Loading = () => {

  const { nextURL } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if(nextURL){
      setTimeout(() => {
        navigate("/" + nextURL);
      }, 3000);
    }
  }, [nextURL, navigate]);

  return (
    <div className='flex justify-center items-center h-[80vh]'>

        <div className='animate-spin rounded-full h-14 w-14 border-4 border-gray-200 border-t-red-500'>

        </div>
    </div>
  )
}

export default Loading