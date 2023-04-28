import "./StatsDueDate.pcss";

export default function StatsDueDate(){
	return (
		<div className="StatsDueDate section">
			<div className="section-filter">
				<div className="filter-item">
					<span>开始时间：</span>
					<div className="date-input">
						<input name="startDate" />
					</div>
				</div>
				<div className="filter-item">
					<span>结束时间：</span>
					<div className="date-input">
						<input name="endDate" />
					</div>
				</div>
				<div className="filter-item">
					<button className="search">查询</button>
				</div>
			</div>
			<div className="section-results">
				<div className="table">
					<div className="thead">
						<div className="tr">
							<div className="td">名称</div>
							<div className="td">标金</div>
							<div className="td">支数</div>
							<div className="td">结束时间</div>
						</div>
					</div>
					<div className="tbody">
						{/* {{#each items}}
						<div className="tr">
							<div className="td">{{unit.name}}&nbsp;</div>
							<div className="td">{{unit.budget}}</div>
							<div className="td">{{unit.unitCount}}</div>
							<div className="td">{{formatDate lastBudgetDate}}</div>
						</div>
						{{/each}} */}
					</div>
				</div>
			</div>
		</div>
	)
}

// export class StatsDueDate extends BaseView {


// 	private get filters() {
// 		const startDateInputEl = <HTMLInputElement>first(this.el, "input[name='startDate']")!;
// 		const endDateInputEl = <HTMLInputElement>first(this.el, "input[name='endDate']")!;
// 		let startDate, endDate;
// 		if (startDateInputEl.value) {
// 			startDate = mom(startDateInputEl.value);
// 		}

// 		if (endDateInputEl.value) {
// 			endDate = mom(endDateInputEl.value);
// 		}
// 		return { startDate, endDate };
// 	}

// 	//#region    ---------- View Events ---------- 
// 	events = addDomEvents(this.events, {
// 		"click; .search": (evt: any) => {
// 			this.refresh();
// 		}
// 	});
// 	//#endregion ---------- /View Events ----------

// 	async postDisplay() {
// 		this.renderDate();
// 	}

// 	private async refresh() {
// 		const filters = this.filters;
// 		const result = await getDueDateUnitsInPeroid(filters.startDate, filters.endDate);
// 		const tableFrag = render("StatsDueDate-table", { items: result.unitSnapshots });
// 		append(first(this.el, ".section-results")!, tableFrag, "empty");
// 	}

// 	private renderDate() {
// 		const startDate = now();
// 		const endDate = now().add(1, "years").month(0).date(0);

// 		const startDateInputEl = <HTMLInputElement>first(this.el, "input[name='startDate']")!;
// 		const endDateInputEl = <HTMLInputElement>first(this.el, "input[name='endDate']")!;
// 		startDateInputEl.value = formatDate(startDate);
// 		endDateInputEl.value = formatDate(endDate);
// 	}
// }

