type Props = { size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' };

const BrandLogo = ({ size = 'md' }: Props) => {
  const dims =
    size === 'sm' ? 28 :
    size === 'md' ? 36 :
    size === 'lg' ? 44 :
    size === 'xl' ? 56 :
    72;
  return (
    <div style={{ width: dims, height: dims }} className="rounded-full overflow-hidden flex items-center justify-center">
      <img src="/mba_suites_logo.png" alt="MBA Suites" className="w-full h-full object-contain" />
    </div>
  );
};

export default BrandLogo;
