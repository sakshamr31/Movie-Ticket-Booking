import React, { useEffect, useState } from 'react'
// import { dummyShowsData } from '../../assets/assets.js';
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { dateFormat } from '../../lib/dateFormat.js';
import { useAppContext } from '../../context/AppContext.jsx';
import toast from 'react-hot-toast';

const ListShows = () => {

  const { axios, getToken, user } = useAppContext();

  const currency = import.meta.env.VITE_CURRENCY

  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAllShows = async () => {
    try{
      const token = await getToken();

      const { data } = await axios.get("/api/admin/all-shows", {
        headers: {
          Authorization: `Bearer ${ token }`
        }
      });
      setShows(data.shows);
    } 

    catch(error){
      toast.error(error.message || "Failed to fetch shows");
    }

    finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    if(!user){
      return;
    }
    getAllShows();
  }, [user]);

  return !loading ? (
    <div>
      <Title text1="List" text2="Shows" />

      <div className='max-w-4xl mt-6 overflow-x-auto'>

        <table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'>
          <thead>

            <tr className="bg-neutral-800 text-left text-white">
              <th className="p-2 font-medium pl-5">Movie Name</th>
              <th className="p-2 font-medium">Show Time</th>
              <th className="p-2 font-medium">Total Bookings</th>
              <th className="p-2 font-medium">Earnings</th>
            </tr>
          </thead>

          <tbody className="text-sm font-light">
            {shows.map((show) => (
              <tr
                key={show._id}
                className="border-b border-gray-200 bg-neutral-700 even:bg-gray-500">

                <td className="p-2 min-w-45 pl-5">{show.movie.title}</td>

                <td className="p-2">{dateFormat(show.showDateTime)}</td>

                <td className="p-2">{Object.keys(show.occupiedSeats).length}</td>

                <td className="p-2">{currency} {Object.keys(show.occupiedSeats).length * show.showPrice}</td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default ListShows