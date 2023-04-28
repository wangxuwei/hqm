import "./Nav.pcss";


const menus = [
  {tab: "home", label:"首页"},
  {tab: "stats", label:"互助会"},
  {tab: "tools", label:"工具"}
];

function Nav(props: {curtab:string, setTab:Function}){

  return (
    <div className="Nav">
      {
        menus.map((m) => {
          return <a key={m.tab} data-tab={m.tab} className={props.curtab == m.tab ? "sel":""} onClick={() => {props.setTab(m.tab)}}>{m.label}</a>
        })
      }
    </div>
  );
}

export default Nav;