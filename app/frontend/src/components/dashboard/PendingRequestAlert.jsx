import { Alert, Button } from 'react-bootstrap';
import { FaTimes } from "react-icons/fa";
import { BsClockHistory } from "react-icons/bs";

/**
 * Függőben lévő csomag igénylés értesítés komponens
 * Megjeleníti az admin jóváhagyására váró előfizetés igénylést visszavonási lehetőséggel
 */
const PendingRequestAlert = ({ requestedPlan, onCancel, getPlanName }) => {
  return (
    <Alert variant="warning" className="mb-4" style={{ borderRadius: '10px' }}>
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <span style={{ fontSize: '1.5rem', marginRight: '15px' }}>
            <BsClockHistory />
          </span>
          <div>
            <strong>Függőben lévő csomag igénylés</strong>
            <p className="mb-0">
              A {getPlanName(requestedPlan)} csomag igénylésed az admin jóváhagyására vár.
            </p>
          </div>
        </div>
        <Button
          variant="outline-danger"
          size="sm"
          onClick={onCancel}
        >
          <FaTimes className="me-1" /> Visszavonás
        </Button>
      </div>
    </Alert>
  );
};

export default PendingRequestAlert;
