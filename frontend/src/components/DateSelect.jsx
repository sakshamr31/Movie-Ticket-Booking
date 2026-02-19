import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const DateSelect = ({dateTime, id}) => {

    const navigate = useNavigate();

    const [selected, setSelected] = useState(null);

    const onBookHandler = () => {
        if(!selected){
            return toast("Please select a date");
        }

        navigate(`/movies/${id}/${selected}`);
    }

  return (
    <div id='dateSelect' className='pt-30'>

        <div className='flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 rounded-lg bg-green-100 border border-b-emerald-500 text-gray-800'>

            <div className='text-lg font-semibold'>
                <p className='bg-blue-400 inline-block px-2 rounded-md mb-3'>Choose Date</p>

                <div className='flex items-center gap-6 text-sm mt-5'>
                    <ChevronLeftIcon width={28} />

                    <span className='grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4'>

                        {Object.keys(dateTime).map((date) => (
                            <button
                                onClick={() => setSelected(date)} 
                                key={date} 
                                className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer ${selected === date ? "bg-red-600 text-white" : "border border-emerald-800"}` }>

                                <span>{new Date(date).getDate()}</span>

                                <span>{new Date(date).toLocaleString("en-US", {month: "short"})}</span>
                            </button>
                        )) }
                    </span>

                    <ChevronRightIcon width={28} />
                </div>
            </div>

            <button 
                onClick={onBookHandler}
                className='bg-red-600 text-white px-6 py-2 mt-6 rounded hover:bg-red-700 shadow-[0_4px_10px_rgba(0,0,0,0.15),0_-4px_10px_rgba(0,0,0,0.15)] transition-all cursor-pointer'>
                Book Now
            </button>
        </div>

    </div>
  )
}

export default DateSelect