import Hero from "@/component/Landingpage/Hero";
import Artists from "@/component/Landingpage/Artists";
import Footer from "@/component/Landingpage/Footer";

export default function Home() {
  return (
    <div className='bg-white'>
      <Hero />
      <Artists />
      <Footer />
    </div>
  );
}
