import { createContext, useContext, useEffect, useState } from "react";
import { EmployeesDataTypes } from "../../../utils/common_types";
import { getUserDetails } from "./userservices";
import { Typography } from "@mui/material";

type UserDetailsContextType={
    userDetails: EmployeesDataTypes | undefined;
    setUserDetails:(userData:EmployeesDataTypes)=>void;
    setRefresh:(isRefresh:boolean)=>void;
    error:string | undefined;
    isRefresh:boolean;
}

type PropTypes={
    children:React.ReactNode;
}

//  Create UserDetails Context
const UserDetailsContext= createContext<UserDetailsContextType | undefined>(undefined);

const token = JSON.parse(localStorage.getItem("kt-auth-react-v") || "{}");
const id=  "66c5ea2f-6cfd-445d-b215-09dd3667c8c5";

// User Details Provider
export const UserDetailsProvider = (props:PropTypes)=>{
    const [userDetails,setUserDetails]= useState<EmployeesDataTypes>();
    const [isRefresh,setRefresh]= useState(false);
    const [loading,setLoading]= useState(false);
    const [error,setError]= useState<string>();

    useEffect(()=>{
        getUserDetails(id,token)
        .then(res=>{
            const {message,success,methodResult}= res.data;
            if(!success){
                throw new Error('Failed to fetch employee details');
            }
            setUserDetails(methodResult);
        })
        .catch(error=>{
           setError('Failed to fetch employee details');
        })
        .finally(()=>{
            setLoading(false);
        })
    },[isRefresh]);

    if(loading){
        return (
            <Typography variant="h3">Loding Employee Details ...</Typography>
        )
    }
    return (
        <UserDetailsContext.Provider value={{userDetails,setUserDetails,isRefresh,setRefresh,error}}>
            {props.children}
        </UserDetailsContext.Provider>
    )
}

// hook for consuming userDetails Context

export const useUserDetails =()=>{
    return useContext(UserDetailsContext);
}