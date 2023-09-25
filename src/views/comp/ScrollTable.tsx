import { Table, TableProps } from 'antd';
import { useEffect, useState } from 'react';
import "./ScrollTable.pcss";

function ScrollTable(props:TableProps<any>, state:any){
  const [scrollY, setScrollY] = useState("")
  //页面加载完成后才能获取到对应的元素及其位置
  useEffect(() => {
    console.log(123);
    setScrollY(getTableScroll())
  }, [])

  return (
    <Table
      {...props}
      scroll={{y:scrollY}}
  />
  )
}

/**
 * 获取第一个表格的可视化高度
 * @param {*} extraHeight 额外的高度(表格底部的内容高度 Number类型,默认为74) 
 * @param {*} id 当前页面中有多个table时需要制定table的id
 */
export function getTableScroll(props? : { extraHeight:any, id:string }) {
  let { extraHeight, id } = props ?? {};
  if (typeof extraHeight == "undefined") {
    //  默认底部分页64 + 边距10
    extraHeight = 74
  }
  let tHeader = null
  if (id) {
    tHeader = document.getElementById(id) ? document.getElementById(id)!.getElementsByClassName("ant-table-thead")[0] : null
  } else {
    tHeader = document.getElementsByClassName("ant-table-thead")[0]
  }
  //表格内容距离顶部的距离
  let tHeaderBottom = 0
  if (tHeader) {
    tHeaderBottom = tHeader.getBoundingClientRect().bottom
  }
  //窗体高度-表格内容顶部的高度-表格内容底部的高度
  let height = `calc(100vh - ${tHeaderBottom + extraHeight}px)`
  return height
}

export default ScrollTable;