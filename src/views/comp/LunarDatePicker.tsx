import { DatePicker } from 'antd';
import { PickerDateProps } from 'antd/es/date-picker/generatePicker';
import type { Dayjs } from "dayjs";
import moment, { Moment } from 'moment';
import { formatLunarDate, solar2lunar } from '../../ts/utils-lunar';
import "./LunarDatePicker.pcss";

function LunarDatePicker(props:PickerDateProps<Dayjs>, state:any){
  return (
    <DatePicker
      {...props}
      className='LunarDatePicker'
      popupClassName='LunarDatePickerPopup'
      cellRender={(current:Dayjs, e) => {
        switch (e.type) {
          case "year":
            return (<div>{current.format("YYYY年")}</div>);
          case "month":
            return (<div>{current.format("M月")}</div>);
          default:
            return (
              <div className="ant-picker-cell-inner">
                <div>{current.date()}</div>
                <div className="lunar-text">{getLunarDate(moment([current.year(), current.month(), current.date()]))}</div>
              </div>);
        }
      }}
  />
  )
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

export default LunarDatePicker;