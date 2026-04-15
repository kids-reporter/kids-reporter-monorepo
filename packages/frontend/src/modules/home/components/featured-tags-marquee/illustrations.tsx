import Image from 'next/image'

function Illustrations() {
  return (
    <div className="relative w-full pt-20 tablet:pt-14 desktop:pt-28">
      <div
        className="relative z-2 h-[64px] w-full bg-[url(/assets/images/home/marquee_wave_s.svg)] bg-[length:375px_64px] bg-center bg-repeat-x tablet:hidden"
        aria-label="subcategories marquee illustrations"
        role="presentation"
      />
      <div
        className="relative z-2 hidden h-[114px] w-full bg-[url(/assets/images/home/marquee_wave_m.svg)] bg-[length:768px_114px] bg-center bg-repeat-x tablet:block desktop:hidden"
        aria-label="subcategories marquee illustrations"
        role="presentation"
      />
      <div
        className="relative z-2 hidden h-[120px] w-full bg-[url(/assets/images/home/marquee_wave_l.svg)] bg-[length:1024px_120px] bg-center bg-repeat-x desktop:block hd:hidden"
        aria-label="subcategories marquee illustrations"
        role="presentation"
      />
      <div
        className="relative z-2 hidden h-[120px] w-full bg-[url(/assets/images/home/marquee_wave_xl.svg)] bg-[length:1440px_120px] bg-center bg-repeat-x hd:block"
        aria-label="subcategories marquee illustrations"
        role="presentation"
      />
      <Image
        src="/assets/images/home/marquee_children_s.svg"
        alt="subcategories marquee illustrations"
        width={164}
        height={120}
        className="absolute right-8 bottom-6 z-1 tablet:hidden"
      />
      <Image
        src="/assets/images/home/marquee_children_m.svg"
        alt="subcategories marquee illustrations"
        width={204}
        height={150}
        className="absolute right-20 bottom-5 z-1 hidden tablet:block desktop:hidden"
      />
      <Image
        src="/assets/images/home/marquee_children_l.svg"
        alt="subcategories marquee illustrations"
        width={272}
        height={200}
        className="absolute right-30 bottom-8 z-1 hidden desktop:block hd:right-[max(120px,calc(50vw-600px))]"
      />
    </div>
  )
}

export default Illustrations
