import "./Ico.pcss";

function Ico(props: {name:string}) {
  return (
    <i className="Ico">
      <svg className={"symbol " + props.name  }>
        <use xlinkHref={"#" + props.name}></use>
      </svg>
    </i>
  );
}

export default Ico;
