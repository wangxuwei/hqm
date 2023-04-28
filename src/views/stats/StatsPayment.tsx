import "./StatsPayment.pcss";



export default function StatsPayment(){
	return (
		<div className="StatsPayment section">
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
					{/* <div className="thead">
						<div className="tr">
							<div className="td">时间</div>
							<div className="td">名称</div>
							<div className="td">标金</div>
							<div className="td">支数</div>
							<div className="td">支付金额</div>
							<div className="td">进度</div>
						</div>
					</div>
					<div className="tbody">
						{{#each items}}
						<div className="tr">
								<div className="td">{{formatDate date}} ({{formatToLunar date}}) {{#isPlusDate date unit}}(加标){{/isPlusDate}}</div>
								<div className="td">{{unit.name}}&nbsp;</div>
								<div className="td">{{unit.budget}}</div>
								<div className="td">{{unit.unitCount}}</div>
								<div className="td">{{payment}}</div>
								<div className="td">{{number}} / {{unit.count}}</div>
						</div>
						{{/each}}
					</div>
					<div className="tfoot">总支出: {{total}}</div> */}
			</div>
		</div>
	</div>
	)
}

// export class StatsPaymentView extends BaseView {


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
// 		const result = await getPaymentInPeriod(filters.startDate, filters.endDate);
// 		const tableFrag = render("StatsPaymentView-payment-table", { items: result.unitSnapshots, total: result.totalPayment });
// 		append(first(this.el, ".section-results")!, tableFrag, "empty");
// 	}

// 	private renderDate() {
// 		const startDate = now();
// 		const endDate = now().add(1, "months").date(0);

// 		const startDateInputEl = <HTMLInputElement>first(this.el, "input[name='startDate']")!;
// 		const endDateInputEl = <HTMLInputElement>first(this.el, "input[name='endDate']")!;
// 		startDateInputEl.value = formatDate(startDate);
// 		endDateInputEl.value = formatDate(endDate);
// 	}

// }

