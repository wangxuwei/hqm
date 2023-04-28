import "./StatsIncome.pcss";

export default function StatsIncome(){
	return (
		<div className="StatsIncome section">
			<div className="section-results">
			<div className="table">
				<div className="thead">
					<div className="tr">
						<div className="td">名称</div>
						<div className="td">标金</div>
						<div className="td">总收入</div>
						<div className="td">支数</div>
						<div className="td">开始时间</div>
						<div className="td">结束时间</div>
						<div className="td">进度</div>
						<div className="td">加标</div>
					</div>
				</div>
				<div className="tbody">
					{/* {{#each items}}
					<div className="tr">
						<div className="td">{{unit.name}}&nbsp;</div>
						<div className="td">{{unit.budget}}&nbsp;</div>
						<div className="td">{{amount}}</div>
						<div className="td">{{unit.unitCount}}</div>
						<div className="td">{{formatDate firstDate}}</div>
						<div className="td">{{formatDate lastBudgetDate}}</div>
						<div className="td">{{number}} / {{unit.count}}</div>
						<div className="td">{{{echo unit.plusCycle "是"}}}&nbsp;</div>
					</div>
					{{/each}}
				</div>
				<div className="tfoot">总支出: {{total}}</div> */}
				</div>
			</div>
			</div>
		</div>
	)
}

// export class StatsIncomeView extends BaseView {

// 	//#region    ---------- View Events ---------- 
// 	events = addDomEvents(this.events, {
// 	});
// 	//#endregion ---------- /View Events ----------

// 	async postDisplay() {
// 		this.refresh();
// 	}

// 	private async refresh() {
// 		const result = await getValidLeftIncome();
// 		const tableFrag = render("StatsIncomeView-income-table", { items: result.unitSnapshots, total: result.totalIncome });
// 		append(first(this.el, ".section-results")!, tableFrag, "empty");
// 	}

// }

