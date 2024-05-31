import { 
    Modal, 
    ModalTitle, 
    ModalContent, 
    ModalActions, 
    ButtonStrip, 
    Button
} from '@dhis2/ui';

const ActionConfirmation = ({Action, title, message, handleClosedConfirmationModal, ActionFunction, engine, selected_tei, setDeletion}) => {

    const handleDelete = async () => {
        try {
          const result = await ActionFunction(engine, selected_tei);
          setDeletion({response: result ? 'Successfull' : 'Failed', tei: selected_tei})
          if (result)
            {
                handleClosedConfirmationModal() 
            }
           
        } catch (error) {
          console.error('An unexpected error occurred:', error);
        }
      };


    return (
        <Modal>
        <ModalTitle>{title}</ModalTitle>
        <ModalContent>
          <div>{message}</div>
        </ModalContent>
        <ModalActions>
          <ButtonStrip>
            <Button onClick={handleClosedConfirmationModal}>Cancel</Button>
            {/* Add save changes logic here */}
            <Button destructive onClick={() =>{
                    if (Action === 'Delete')
                        {
                            handleDelete()
                        }            
                }
                  
            }
                >Confirm {Action}
            </Button>
          </ButtonStrip>
        </ModalActions>
      </Modal>
    );

}
export default ActionConfirmation;