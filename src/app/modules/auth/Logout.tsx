import {useEffect} from 'react'
import {Navigate, Routes} from 'react-router-dom'
import { logout } from '../../Redux/Reducers/authSlice'
import { useDispatch } from 'react-redux'

export function Logout() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(logout());
    document.location.reload()
  }, [logout])

  return (
    <Routes>
      <Navigate to='/auth/login' />
    </Routes>
  )
}
