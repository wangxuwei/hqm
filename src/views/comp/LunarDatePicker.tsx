import { DatePicker } from 'antd';
import { PickerBaseProps, PickerDateProps } from 'antd/es/date-picker/generatePicker';
import { Dayjs } from "dayjs";
import { date } from '../../ts/utils-date';
import { formatLunarDate, solar2lunar } from '../../ts/utils-lunar';
import "./LunarDatePicker.pcss";

function LunarDatePicker(props:PickerBaseProps<Dayjs> | PickerDateProps<Dayjs>, state:any){
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
                <div className="lunar-text">{getLunarDate(date(`${current.year()}-${current.month()}-${current.date()}`))}</div>
              </div>);
        }
      }}
  />
  )
}

// for lunar
function getLunarDate(date: Dayjs) {
  const lunarDate = solar2lunar(date);
  if (lunarDate.day == 1) {
    return formatLunarDate(date, "M");
  } else {
    return formatLunarDate(date, "D");
  }
}

export default LunarDatePicker;