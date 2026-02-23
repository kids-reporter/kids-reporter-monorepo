'use client'

import Image from 'next/image'

import { PRODUCTS } from './constants'

function RelatedProducts() {
  return (
    <section
      id="products"
      className="mx-auto flex w-full max-w-300 scroll-margin-anchor flex-col items-center justify-center px-6 pt-10 pb-20 tablet:px-8 tablet:pt-12 tablet:pb-24 desktop:px-12 desktop:pt-18 desktop:pb-32 hd:px-14 hd:pt-24 hd:pb-36"
    >
      <h2 className="mb-6 flex items-center gap-2 self-start prose-h2-small !font-swei text-neutral-900 desktop:mb-10 desktop:prose-h2-large">
        <Image
          src="/assets/images/about/related-products/icon.svg"
          alt="Related Products"
          className="size-11 desktop:size-16"
          width={64}
          height={64}
        />
        相關產品
      </h2>

      <div className="flex w-full flex-col gap-6 tablet:flex-row desktop:gap-8">
        {PRODUCTS.map((product) => {
          const iconPath = `/assets/images/about/related-products/${product.iconType}_icon.svg`
          const illustrationPath = `/assets/images/about/related-products/${product.illustration}`

          return (
            <div
              key={product.id}
              className="flex flex-1 flex-col overflow-hidden rounded-3xl bg-neutral-white shadow-custom"
            >
              <div className="relative flex aspect-[327/183] items-center justify-center tablet:aspect-[218/123] desktop:aspect-video">
                <Image
                  src={illustrationPath}
                  alt={product.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  fill
                />
                <div className="absolute -bottom-4 left-6 z-10 flex items-center justify-center rounded-tl-3xl rounded-br-3xl desktop:-bottom-5 desktop:left-8">
                  <Image
                    src={iconPath}
                    alt={`${product.title} icon`}
                    className="size-12"
                    width={48}
                    height={48}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 p-6 desktop:p-8">
                <h5 className="prose-h5-small text-neutral-900 desktop:prose-h5-large">
                  {product.title}
                </h5>
                <p className="prose-p1 text-neutral-700">
                  {product.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default RelatedProducts
