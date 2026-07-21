import FabricUnderline from './FabricUnderline';

export default function SectionHeading({
  eyebrow,
  title,
  align = 'left',
}: {
  eyebrow?: string;
  title: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      {eyebrow && (
        <p className="mb-3 text-xs uppercase tracking-widest2 text-sarong-red">{eyebrow}</p>
      )}
      <h2 className="font-sans text-3xl md:text-4xl tracking-tight text-sarong-black">
        {title}
      </h2>
      <FabricUnderline
        className={`mt-4 w-16 ${align === 'center' ? 'mx-auto' : ''}`}
        color="#1C1C1C"
      />
    </div>
  );
}
