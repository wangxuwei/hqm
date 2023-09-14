import moment, { Moment } from 'moment';
import { useEffect, useRef, useState } from 'react';
import { formatDate, now } from '../../ts/utils-date';
import { formatLunarDate, solar2lunar } from '../../ts/utils-lunar';
import "./DatePicker.pcss";
import Ico from './Ico';

function DatePicker(props:{onSelect?:Function, onCancel?:Function, date?:Moment}, state:{}){

  const nw = props.date ?? now();
  const [calendar, setCalendar] = useState(getCalendars(nw.month(), nw.year()));

	const wrapperRef = useRef<HTMLDivElement | null>(null);
	useEffect(() => {
		const handle = (event:Event) => {
			if(!wrapperRef.current?.contains(event.target as Node)){
				props.onCancel?.();
			}
		};
		document.addEventListener('click',handle)
		return () => document.removeEventListener('click',handle)
	});

	function nextMonth(next:boolean){
		const dir = next ? 1 : -1;
		let n = moment([calendar.year, calendar.month, 1])
		n = n.add(dir, 'month');
		setCalendar(getCalendars(n.month(), n.year()));
	}
		
  return (
    <div className="DatePicker" ref={wrapperRef}>
      <div className="DatePicker-content">
        <div className="DatePicker-calendar">
          <div className="calendar-header">
            <span className="action actionPrev" onClick={() => {nextMonth(false)}}>
              <Ico name="ico-double-arrow-left"/>
            </span>
            <span>
              <span>{calendar.monthLabel}</span>
              <span className="year">{calendar.year}<span className="icon-fa fa-caret-down"></span></span>
              <select name="yearSelect" className="hide">
              </select>
            </span>
            <span className="action actionNext" onClick={() => {nextMonth(true)}}>
              <Ico name="ico-double-arrow-right" />
            </span>
          </div>
          <table className="DatePicker-calendar-table">
            <thead>
              <tr className="calendar-week">
                <th data-vale="0">日</th>
                <th data-vale="1">一</th>
                <th data-vale="2">二</th>
                <th data-vale="3">三</th>
                <th data-vale="4">四</th>
                <th data-vale="5">五</th>
                <th data-vale="6">六</th>
              </tr>
            </thead>
            <tbody>
              {calendar.weeks.map((w:any, i:number) => {
                return (<tr key={i}>
                  {
                    w.map((d:any, j:number) => {
                      return (<td key={j}>
                        <div className={["date", !d.currentMonth ?  "disable" : "", d.dataValue == nw.date() ? 'selected' : ""].join(" ")} onClick={() => props.onSelect?.(d.date)}>
                          <span className="solar">{d.dataValue}</span>
                          <span className="lunar">{d.lunar}</span>
                        </div>
                      </td>)
                    })
                  }
                  </tr>)
              })}
            </tbody>
          </table>
          <div className="calendar-footer">
            <div className="button today"  onClick={() => props.onSelect?.(now())}>Today</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getCalendars(month: number, year: number) {
	const calendar: any = {};
	const firstDateOfMonth: Moment = moment([year, month, 1]);

	const endDateOfMonth = firstDateOfMonth.clone().add(1, "months").date(0);
	const weeks = [];
	let week = new Array(7);
	for (let i = 0; i < endDateOfMonth.date(); i++) {
		const date = firstDateOfMonth.clone().add(i, 'day');
		const dataValue = date.date();
		const dateFormatStr = formatDate(date);
		week[date.day()] = {
			date,
			dataValue: dataValue,
			dateStr: dateFormatStr,
			currentMonth: true,
			lunar: getLunarDate(date)
		};
		if (date.day() % 7 == 6) {
			weeks.push(week);
			if (endDateOfMonth.date() - i > 1) {
				week = new Array(7);
			}
		}
	}
	if (endDateOfMonth.day() % 7 != 6) {
		weeks.push(week);
	}

	// add last month dates
	for (let i = firstDateOfMonth.day() - 1; i >= 0; i--) {
		const date = firstDateOfMonth.clone().subtract(firstDateOfMonth.day() - i, 'day');
		const dataValue = date.date();
		const dateFormatStr = formatDate(date);
		weeks[0][i] = {
			date,
			dataValue: dataValue,
			dateStr: dateFormatStr,
			currentMonth: false,
			lunar: getLunarDate(date)
		}
	}

	//add next month dates
	for (let i = endDateOfMonth.day() + 1; i <= 6; i++) {
		const date = endDateOfMonth.clone().add(i - endDateOfMonth.day(), 'day');
		const dataValue = date.date();
		const dateFormatStr = formatDate(date);
		weeks[weeks.length - 1][i] = {
			date,
			dataValue: dataValue,
			dateStr: dateFormatStr,
			currentMonth: false,
			lunar: getLunarDate(date)
		}
	}

	calendar.year = firstDateOfMonth.year();
	calendar.month = firstDateOfMonth.month();
	calendar.monthLabel = `${firstDateOfMonth.month() + 1}月`;
	calendar.weeks = weeks;
	return calendar;
}

// for lunar
function getLunarDate(date: Moment) {
	const lunarDate = solar2lunar(date);
	if (lunarDate.day == 1) {
		return formatLunarDate(date, "M");
	} else {
		return formatLunarDate(date, "D");
	}
}


export default DatePicker;