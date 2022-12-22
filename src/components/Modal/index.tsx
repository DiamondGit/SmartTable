import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Modal as AntdModal } from "antd";
import { useContext, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import TableUIContext from "../../context/TableUIContext";
import { ModalTypes, Z_ModalTypes } from "../../types/general";
import style from "./Modal.module.scss";

export interface ModalType {
    title?: React.ReactNode;
    open: boolean;
    onCancel: () => void;
    leftFooter?: React.ReactNode;
    rightFooter?: React.ReactNode;
    type: ModalTypes;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

const Modal = ({ title, open, onCancel, leftFooter = null, rightFooter = null, type, children, ...props }: ModalType) => {
    const UI = useContext(TableUIContext);
    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const draggleRef = useRef<HTMLDivElement>(null);
    
    const modalProps = {
        title: (
            <div className={style.title}>
                {type !== Z_ModalTypes.enum.SETTINGS ? (
                    <div
                        className={style.draggable}
                        onMouseOver={() => {
                            if (disabled) {
                                setDisabled(false);
                            }
                        }}
                        onMouseOut={() => {
                            setDisabled(true);
                        }}
                        onFocus={() => {}}
                        onBlur={() => {}}
                    >
                        {title} <DragIndicatorIcon sx={{ opacity: 0.3 }} />
                    </div>
                ) : (
                    title
                )}
            </div>
        ),
        open: open,
        closeIcon: <CloseIcon />,
        closable: true,
        okText: "ОК",
        cancelText: "Отмена",
        footer: (
            <div className={style.footer}>
                {!!leftFooter && <div className={`${style.btnContainer} ${style.left}`}>{leftFooter}</div>}
                <div className={`${style.btnContainer} ${style.right}`}>
                    {!!rightFooter ? (
                        <>{rightFooter}</>
                    ) : (
                        <>
                            <UI.SecondaryBtn onClick={onCancel}>Закрыть</UI.SecondaryBtn>
                            <UI.SecondaryBtn>ОК</UI.SecondaryBtn>
                        </>
                    )}
                </div>
            </div>
        ),
        onCancel: onCancel,
        forceRender: true,
        modalRender:
            type !== Z_ModalTypes.enum.SETTINGS
                ? (modal: React.ReactNode) => (
                      <Draggable disabled={disabled} bounds={bounds} onStart={onStart}>
                          <div ref={draggleRef}>{modal}</div>
                      </Draggable>
                  )
                : undefined,
    };

    const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
        const { clientWidth, clientHeight } = window.document.documentElement;
        const targetRect = draggleRef.current?.getBoundingClientRect();
        if (!targetRect) {
            return;
        }

        setBounds({
            left: -targetRect.left + uiData.x,
            right: clientWidth - (targetRect.right - uiData.x),
            top: -targetRect.top + uiData.y,
            bottom: clientHeight - (targetRect.bottom - uiData.y),
        });
    };

    return (
        <AntdModal {...modalProps} {...props} style={{ top: 200 }} className={style.modal}>
            {children}
        </AntdModal>
    );
};

export default Modal;
