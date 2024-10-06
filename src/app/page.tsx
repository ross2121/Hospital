import GoogleMaps from "@/components/GoogleMaps";
import axios from "axios";

export default function Home() {
  async function getUserDetails() {
    try {
      const response = await axios.get("http://localhost:3000/api/user")
      return response.data;
    }  catch(e) {
      console.log(e);
    }
  }
  return (
    <div>
      <GoogleMaps />
      
    </div>
  );
}
