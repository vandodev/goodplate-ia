import axios from "axios";

export const api =  axios.create({
  baseURL: 'https://api.clarifai.com',
  headers:{
    'Accept': 'application/json',
    "Authorization":"Key d94db87173c54f7f8caea7930f271899"    
  }
})