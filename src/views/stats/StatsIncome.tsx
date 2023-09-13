import { useEffect, useState } from 'react';
import { Unit } from '../../bindings';
import { unitFmc } from '../../model/fmc-unit';
import "./StatsIncome.pcss";

export default function StatsIncome() {

  const [items, setItems] = useState([] as { unit: Unit, first_date: string, last_budget_date: string, amount: number, number: number }[]);
  const [total, setTotal] = useState(0);


  function refresh() {
    unitFmc.getValidLeftIncome().then((result) => {
      setItems(result.unit_snapshots);
      setTotal(result.total_income);
    });
  }

  useEffect(() => {
    refresh();
  }, [setItems]);

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
                  <div className="td">{unit.unit_count.toString()}</div>
                  <div className="td">{r.first_date}</div>
                  <div className="td">{r.last_budget_date}</div>
                  <div className="td">{r.number} / {unit.count.toString()}</div>
                  <div className="td">{unit.plus_cycle ? "是" : "否"}</div>
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
