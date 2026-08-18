import IntroScene from "@/components/sections/IntroScene";
import MessageLine from "@/components/sections/MessageLine";
import PhotoWall from "@/components/sections/PhotoWall";
import CakeCutting from "@/components/sections/CakeCutting";
import RoyalMessage from "@/components/sections/RoyalMessage";
import FinalWish from "@/components/sections/FinalWish";
import SectionWrapper from "@/components/SectionWrapper";

import CakeIntro from "@/components/sections/CakeIntro";

export default function Home() {
  return (
    <main className="w-full relative bg-theme-dark overflow-x-hidden">
      <SectionWrapper>
        <IntroScene />
      </SectionWrapper>
      
      <SectionWrapper>
        <MessageLine />
      </SectionWrapper>
      
      <SectionWrapper>
        <PhotoWall />
      </SectionWrapper>
      
      <SectionWrapper>
        <CakeIntro />
      </SectionWrapper>

      <SectionWrapper>
        <CakeCutting />
      </SectionWrapper>
      
      <RoyalMessage />
      
      <SectionWrapper>
        <FinalWish />
      </SectionWrapper>
    </main>
  );
}
