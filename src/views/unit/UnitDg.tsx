import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { Form, Modal } from 'antd';
import { useCallback } from 'react';
import { Unit } from '../../bindings';
import { antdModal } from '../../ts/nice-modal-fix';
import "./UnitDg.pcss";

export default NiceModal.create(({ unit }: {unit?:Unit}) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const meta = {
    initialValues: unit,
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'job', label: 'Job Title', required: true },
    ],
  };

  const handleSubmit = useCallback(() => {
    form.validateFields().then(() => {
      const newUnit = { ...form.getFieldsValue() };
      // In real case, you may call API to create unit or update unit
      if (!unit) {
        newUnit.id = String(Date.now());
      } else {
        newUnit.id = unit.id;
      }
      modal.resolve(newUnit);
      modal.hide();
    });
  }, [modal, unit, form]);


  return (
    <Modal
      {...antdModal(modal)}
      title={unit ? '会信息修改' : '添加会'}
      okText={unit ? '修改' : '添加'}
      onOk={handleSubmit}
    >
      <Form form={form}>
        dfdfdf
      </Form>
    </Modal>
  );
});