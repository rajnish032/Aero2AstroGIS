import Link from 'next/link';
//import logo2 from "../assets/logo.png"
import { LinkedinFilled, MailFilled } from "@ant-design/icons";

const Footer = () => {
    return (
        <footer className=" to bg-[#0a0a09] ">


{/* Map */}

<div style={{ width: '100%', height: '450px' }}>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.651165691895!2d80.2225441745441!3d12.801140318593639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a525084733071f5%3A0x3d65ae9cf5c5795f!2sAero2Astro!5e0!3m2!1sen!2sin!4v1718123206700!5m2!1sen!2sin"
        width="100%"
        height="400"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>


  
      <div className="container p-5 md:px-10 mx-auto flex flex-col md:flex-row justify-between">
        <div className="mb-8 md:mb-0">
          <h1 className="text-2xl font-bold text-white mb-2">
            <span className="text-[#0055d4]">#</span>aero
            <span className="text-[#0055d4]">2</span>astro
          </h1>
          <p className="text-gray-400">Think. Innovate. Explore.</p>
          <blockquote className="mt-4 text-gray-500 lg:max-w-[64%]">
            Outstanding people have one thing in common: an absolute sense of mission.
    
Their vision is clear, and their passion fuels their relentless pursuit of aerial excellence.
     

           
          </blockquote>
           <a href="mailto:flywithus@aero2astro.com" className=" mt-5 block font-bold text-[#0055d4]"><MailFilled className="mr-2"/>flywithus@aero2astro.com</a>
          
        </div>
        <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-20 md:mr-20">
          <div>
            <h2 className="text-gray-400 mb-4">CORPORATE</h2>
            <ul className="space-y-2">
              <li><a target="_blank" href="https://aero2astro.com/home/contact" className="text-white hover:text-gray-400">Contact Us</a></li>
              <li><a target="_blank" href="https://aero2astro.com/home/corporate/Careers" className="text-white hover:text-gray-400">Careers</a></li>
              <li><a target="_blank" href="https://aero2astro.com/home/corporate/Internship" className="text-white hover:text-gray-400">Internships</a></li>
              <li><a target="_blank" href="https://aero2astro.com/home/contact/appointment" className="text-white hover:text-gray-400">Schedule an appointment</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-gray-400 mb-4">INNOVATION LABZ</h2>
            <ul className="space-y-2">
              <li><a target="_blank" href="https://aero2astro.com/home/soon" className="text-white hover:text-gray-400">Shop</a></li>
              <li><a target="_blank" href="https://www.aero2astro.com/mayvi" className="text-white hover:text-gray-400">Mayvi</a></li>
              <li><a target="_blank" href="https://aero2astro.com/home/soon" className="text-white hover:text-gray-400">Learn to fly</a></li>
              <li><a target="_blank" href="https://aero2astro.com/home/soon" className="text-white hover:text-gray-400">Aeromodelling Club</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-gray-400 mb-4">TERMS</h2>
            <ul className="space-y-2">
              <li><a target="_blank" href="https://aero2astro.com/home/soon" className="text-white hover:text-gray-400">Privacy Policy</a></li>
              <li><a target="_blank" href="https://aero2astro.com/home/soon" className="text-white hover:text-gray-400">Cookies Policy</a></li>
            </ul>
          </div>
        </div>
      </div>
        <div className="p-5 md:px-10 border-t-[1px] border-t-[#0055d4]">
          <p className="font-thin text-center">Copyright &copy; 2024 <a target="_blank" href="https://aero2astro.com" className="font-semibold text-[#0055d4]">
          Aero2Astro </a></p>
        </div>

  

</footer>

    );
}

export default Footer;
