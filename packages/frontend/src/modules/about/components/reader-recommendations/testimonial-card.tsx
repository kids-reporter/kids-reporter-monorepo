import { Testimonial } from './constants'

type TestimonialCardProps = {
  testimonial: Testimonial
}

function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <div className="flex h-full flex-col rounded-3xl border-2 border-neutral-200 bg-neutral-white p-6 desktop:p-8">
      <p className="mb-6 flex-1 prose-p1 text-neutral-900">
        {testimonial.text}
      </p>
      <div className="flex items-center gap-3">
        <div className="h-12 w-1 rounded-[6px] bg-red-400"></div>
        <div className="flex flex-col">
          <p className="prose-p1-bold text-neutral-900">{testimonial.name}</p>
          <p className="prose-p2 text-neutral-700">{testimonial.title}</p>
        </div>
      </div>
    </div>
  )
}

export default TestimonialCard
