function SearchHero() {
  return (
    <div className="w-full">
      <picture>
        <source
          media="(min-width: 1440px)"
          srcSet="/assets/images/search/search-hero-desktop-art.svg"
        />
        <source
          media="(min-width: 768px)"
          srcSet="/assets/images/search/search-hero-tablet-art.svg"
        />
        <img
          src="/assets/images/search/search-hero-mobile-art.svg"
          alt=""
          className="mx-auto block h-auto w-[300px] tablet:w-[444px]"
          loading="lazy"
          aria-hidden="true"
        />
      </picture>
    </div>
  )
}

export default SearchHero
