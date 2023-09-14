import { Moment } from 'moment';
import { MouseEvent, useEffect, useState } from 'react';
import { Unit } from '../../bindings';
import { unitFmc } from '../../model/fmc-unit';
import { formatDate, mom, now } from '../../ts/utils-date';
import { formatLunarDate, solar2lunar } from '../../ts/utils-lunar';
import DatePicker from '../comp/DatePicker';
import "./StatsPayment.pcss";



export default function StatsPayment(){

  const [startDate, setStartDate] = useState(now());
  const [endDate, setEndDate] = useState(now().add(1, "months").date(0));
  const [items, setItems] = useState([] as {
    unit:Unit
    date: string,
    payment:number,
    number: number}[]);
  const [total, setTotal] = useState(0);

  const [pickers, setShowPicker] = useState([false,false]);

  function refresh(){
    unitFmc.getPaymentInPeriod(startDate.toISOString(true), endDate.toISOString(true)).then((result) => {
      setItems(result.unit_snapshots);
      setTotal(result.total_payment);
    });
  }

  function onSearch(){
    refresh();
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

  useEffect(() => {
    refresh();
  }, [setItems]);
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
          <button className="search" onClick={onSearch}>查询</button>
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
              (items??[]).map((r, i) => {
                const unit = r.unit;
                const date = mom(mom(r.date));
                let day = date.date();
                if(unit.is_lunar){
                  const lunarDate = solar2lunar(date);
                  day = lunarDate.day;
                }
                return (
                  <div className="tr" key={i}>
                    <div className="td">{formatDate (date)} ({formatLunarDate (date)}) {day !== unit.day ? "(加标)":""}</div>
                    <div className="td">{unit.name}</div>
                    <div className="td">{unit.budget.toString()}</div>
                    <div className="td">{unit.unit_count.toString()}</div>
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