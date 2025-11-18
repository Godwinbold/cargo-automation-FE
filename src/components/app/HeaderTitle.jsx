const HeaderTitle = ({ title, description }) => {
  return (
    <div>
      <h1 className="font-bold">{title} </h1>
      <p className="text-xs max-w-lg">{description}</p>
    </div>
  );
};

export default HeaderTitle;
