import { Moment } from 'moment';
import { MouseEvent, useState } from 'react';
import { Unit } from '../../bindings';
import { getPaymentInPeriod } from '../../ts/service-unit';
import { toDateInfo } from '../../ts/unit-cal';
import { formatDate, formatToLunar, mom, now } from '../../ts/utils-date';
import DatePicker from '../comp/DatePicker';
import "./StatsPayment.pcss";



export default function StatsPayment(){

  const [startDate, setStartDate] = useState(now());
  const [endDate, setEndDate] = useState(now().add(1, "months").date(0));
  const [items, setItems] = useState([] as {
    unit:Unit
    date: Moment,
    payment:number,
    number: number}[]);
  const [total, setTotal] = useState(0);

  const [pickers, setShowPicker] = useState([false,false]);

  function refresh(){
    getPaymentInPeriod(startDate, endDate).then((result) => {
      setItems(result.unitSnapshots);
      setTotal(result.totalPayment);
    });
  }

  function onDateSelect(value:Moment, name:string){
    if(name == 'start'){
      setStartDate(value);
    }else{
      setEndDate(value);
    }
    setShowPicker([false, false]);
  }

  function onDateCancel(name:string){
    setShowPicker([false, false]);
  }

  function showPicker(e:MouseEvent, arr:boolean[]){
    e.stopPropagation();
    setShowPicker(arr);
  }

  refresh();
  return (
    <div className="StatsPayment section">
      <div className="section-filter">
        <div className="filter-item">
          <span>开始时间：</span>
          <div className="date-input">
            <input name="startDate" value={formatDate(startDate)} onChange={(e) => setStartDate(mom(e.target.value))} onClick={(e:MouseEvent) => {showPicker(e, [true,false])}} />
            {pickers[0] && <DatePicker onSelect={(d:Moment) => onDateSelect(d, 'start')} onCancel={onDateCancel} /> }
          </div>
        </div>
        <div className="filter-item">
          <span>结束时间：</span>
          <div className="date-input">
            <input name="endDate" value={formatDate(endDate)} onChange={(e) => setEndDate(mom(e.target.value))}  onClick={(e) => showPicker(e,[false, true])} />
            {pickers[1] && <DatePicker onSelect={(d:Moment) => onDateSelect(d, 'end')} onCancel={onDateCancel} /> }
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
              <div className="td">时间</div>
              <div className="td">名称</div>
              <div className="td">标金</div>
              <div className="td">支数</div>
              <div className="td">支付金额</div>
              <div className="td">进度</div>
            </div>
          </div>
          <div className="tbody">
            {
              items.map((r, i) => {
                const unit = r.unit;
                const dateInfo = toDateInfo(r.date, unit.isLunar);
                return (
                  <div className="tr" key={i}>
                    <div className="td">{formatDate (r.date)} ({formatToLunar (r.date)}) {BigInt(dateInfo.day) == unit.day ? "(加标)":""}</div>
                    <div className="td">{unit.name}</div>
                    <div className="td">{unit.budget.toString()}</div>
                    <div className="td">{unit.unitCount.toString()}</div>
                    <div className="td">{r.payment}</div>
                    <div className="td">{r.number} / {unit.count.toString()}</div>
                  </div>)
              })
            }
          </div>
          <div className="tfoot">总支出: {total}</div>
      </div>
    </div>
  </div>
  )
}