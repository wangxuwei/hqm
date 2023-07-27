import { Moment } from 'moment';
import { useState } from 'react';
import { Unit } from '../../bindings';
import { getValidLeftIncome } from '../../ts/service-unit';
import { formatDate } from '../../ts/utils-date';
import "./StatsIncome.pcss";

export default function StatsIncome() {

  const [items, setItems] = useState([] as { unit: Unit, firstDate: Moment, lastBudgetDate: Moment, amount: number, number: number }[]);
  const [total, setTotal] = useState(0);


  function refresh() {
    getValidLeftIncome().then((result) => {
      setItems(result.unitSnapshots);
      setTotal(result.totalIncome);
    });
  }

  refresh();

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
            {items.map((r, i) => {
              const unit = r.unit;
              return (
                <div className="tr" key={i}>
                  <div className="td">{unit.name}</div>
                  <div className="td">{unit.budget.toString()}</div>
                  <div className="td">{r.amount}</div>
                  <div className="td">{unit.unitCount.toString()}</div>
                  <div className="td">{formatDate(r.firstDate)}</div>
                  <div className="td">{formatDate(r.lastBudgetDate)}</div>
                  <div className="td">{r.number} / {unit.count.toString()}</div>
                  <div className="td">{unit.plusCycle ? "是" : "否"}</div>
                </div>
              )
            })}
          </div>
          <div className="tfoot">总支出: {total}</div>
        </div>
      </div>
    </div>
  )
}
