import { Moment } from 'moment';
import { useState } from 'react';
import { Unit } from '../../bindings';
import { getDueDateUnitsInPeroid } from '../../ts/service-unit';
import { formatDate, mom, now } from '../../ts/utils-date';
import DatePicker from '../comp/DatePicker';
import "./StatsDueDate.pcss";

export default function StatsDueDate() {

  const [startDate, setStartDate] = useState(now());
  const [endDate, setEndDate] = useState(now().add(1, "years").month(0).date(0));
  const [items, setItems] = useState([] as ({ unit: Unit, lastBudgetDate: Moment })[]);
  const [pickers, setShowPicker] = useState([false, false]);

  function refresh() {
    getDueDateUnitsInPeroid(startDate, endDate).then((result) => {
      setItems(result.unitSnapshots);
    });
  }

  function onDateSelect(value: Moment, name: string) {
    if (name == 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
    setShowPicker([false, false]);
  }

  function onDateCancel(name: string) {
    setShowPicker([false, false]);
  }

  function showPicker(e: MouseEvent, arr: boolean[]) {
    e.stopPropagation();
    setShowPicker(arr);
  }

  refresh();

  return (
    <div className="StatsDueDate section">
      <div className="section-filter">
        <div className="filter-item">
          <span>开始时间：</span>
          <div className="date-input">
            <input name="startDate" value={formatDate(startDate)} onChange={(e) => setStartDate(mom(e.target.value))} />
            {pickers[0] && <DatePicker onSelect={(d: Moment) => onDateSelect(d, 'start')} onCancel={onDateCancel} />}
          </div>
        </div>
        <div className="filter-item">
          <span>结束时间：</span>
          <div className="date-input">
            <input name="endDate" value={formatDate(endDate)} onChange={(e) => setEndDate(mom(e.target.value))} />
            {pickers[1] && <DatePicker onSelect={(d: Moment) => onDateSelect(d, 'end')} onCancel={onDateCancel} />}
          </div>
        </div>
        <div className="filter-item">
          <button className="search" onClick={refresh}>查询</button>
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
            {
              items.map((r, i) => {
                const unit = r.unit;
                return (
                  <div className="tr" key={i}>
                    <div className="td">{unit.name}</div>
                    <div className="td">{unit.budget.toString()}</div>
                    <div className="td">{unit.unitCount.toString()}</div>
                    <div className="td">{formatDate(r.lastBudgetDate)}</div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </div>
  )
}