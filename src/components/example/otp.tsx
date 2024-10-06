"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
// import { useRecoilState } from "recoil";
// import { authState } from "../atoms/atutomath";
import { Input } from "../ui/input";
import { jwtDecode } from "jwt-decode"; // Correct import

const OTPPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setuser] = useState({ value: null });
//   const [auth, setAuth] = useRecoilState(authState);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const tempUserData = localStorage.getItem("tempUserData");
      if (!tempUserData) {
        throw new Error("No user data found in localStorage.");
      }

      const parsedData = JSON.parse(tempUserData);
      const { name, email, password } = parsedData;

      // Validate that required fields are present
      if (!name || !email || !password) {
        throw new Error("Incomplete user data.");
      }
      localStorage.clear();
      // Make the API call for OTP verification
      const response = await axios.post(
        "https://wechat-3aqg.onrender.com/api/verifyotp",
        {
          code: otp,
          name,
          email,
          password,
        }
      );

      if (response.status === 200) {
        const { token, user } = response.data;
        const decodedToken = jwtDecode<{ role: string }>(token);
        // const user=response.data.user;
        // setAuth({
        //   isAuthenticated: true,
        //   role: decodedToken.role,
        //   user: response.data.user,
        //   token: token,
        // });
        localStorage.setItem("authtoken", token);
        localStorage.setItem("user", email);

        console.log(user.role);
        router.push("/");
      } else {
        setError(
          response.data.message || "OTP verification failed. Please try again."
        );
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again."
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-24 rounded-xl bg-black/80 py-10 px-6 md:mt-0 md:max-w-sm md:px-14">
      <form onSubmit={handleSubmit}>
        <div className="flex justify-center">
          <h1 className="text-3xl font-semibold text-white">
            OTP Verification
          </h1>
        </div>
        <div className="space-y-4 mt-5">
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="bg-[#333] placeholder:text-xs text-white placeholder:text-gray-400 w-full inline-block"
            maxLength={6}
            required
            disabled={loading}
          />
          <Button
            type="submit"
            variant="destructive"
            className="bg-[#e50914] text-black w-full"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default OTPPage;