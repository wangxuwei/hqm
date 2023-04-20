import "./App.pcss";


// let pathToView: { [name: string]: BaseViewClass } = {
// 	"home": HomeView,
// 	"stats": StatsView,
// 	"tools": ToolsView
// };


function App() {

  return (
    <div className="MainView">
      <header>
        <h3>统计工具</h3>
      </header>
      
      <nav></nav>

      <main>
      </main>
      <footer>
        some footer
      </footer>
    </div>
  );
}

export default App;
