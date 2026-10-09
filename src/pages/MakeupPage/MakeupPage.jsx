import ExtraList from '../../components/ExtraList/ExtraList';

export default function MakeupPage({
  extras,
  settings,
  openAdd,
  updateExtraStatus,
}) {
  return (
    <ExtraList
      title="Dạy bù"
      type="makeup"
      extras={extras}
      settings={settings}
      openAdd={openAdd}
      updateExtraStatus={updateExtraStatus}
    />
  );
}