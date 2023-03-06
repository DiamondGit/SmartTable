import CloseIcon from "@mui/icons-material/Close";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { Button, Modal as AntdModal } from "antd";
import { useContext, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { ModalTypes, Z_ModalTypes } from "../../types/enums";
import style from "./Modal.module.scss";

export interface ModalType {
    Title: () => JSX.Element;
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    leftFooter?: React.ReactNode;
    rightFooter?: React.ReactNode;
    type: ModalTypes;
    closable?: boolean;
    isTransparentModal?: boolean;
    hideRightFooter?: boolean;
    children?: React.ReactNode;
    width?: number;
    style?: React.CSSProperties;
}

const Modal = ({
    Title,
    open,
    onConfirm,
    onCancel,
    leftFooter = null,
    rightFooter = null,
    type,
    closable = true,
    isTransparentModal = false,
    hideRightFooter = false,
    width = 520,
    children,
    ...props
}: ModalType) => {
    const [disabled, setDisabled] = useState(true);
    const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
    const draggleRef = useRef<HTMLDivElement>(null);

    const defaultOkText = "ОК";
    const defaultCancelText = "Отмена";

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
        <AntdModal
            {...{
                title: (
                    <div className={style.title}>
                        {type !== Z_ModalTypes.enum.SETTINGS ? (
                            <div
                                className={style.draggable}
                                onMouseEnter={() => {
                                    if (disabled) {
                                        setDisabled(() => false);
                                    }
                                }}
                                onMouseLeave={() => {
                                    setDisabled(() => true);
                                }}
                                onFocus={() => {}}
                                onBlur={() => {}}
                            >
                                <Title />
                                <DragIndicatorIcon sx={{ opacity: 0.3 }} />
                            </div>
                        ) : (
                            <Title />
                        )}
                    </div>
                ),
                open: open,
                closeIcon: <CloseIcon />,
                maskClosable: closable,
                closable: closable,
                okText: defaultOkText,
                cancelText: defaultCancelText,
                footer: (
                    <div className={style.footer}>
                        {!!leftFooter && <div className={`${style.btnContainer} ${style.left}`}>{leftFooter}</div>}
                        {!hideRightFooter && (
                            <div className={`${style.btnContainer} ${style.right}`}>
                                {!!rightFooter ? (
                                    <>{rightFooter}</>
                                ) : (
                                    <>
                                        <Button onClick={onCancel}>{defaultCancelText}</Button>
                                        <Button type="primary" onClick={onConfirm}>{defaultOkText}</Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ),
                onCancel: onCancel,
                forceRender: true,
                width: width,
                modalRender:
                    type !== Z_ModalTypes.enum.SETTINGS
                        ? (modal: React.ReactNode) => (
                              <Draggable disabled={disabled} bounds={bounds} onStart={onStart}>
                                  <div ref={draggleRef}>{modal}</div>
                              </Draggable>
                          )
                        : undefined,
            }}
            style={{ top: 150, ...props.style, opacity: isTransparentModal ? 0.1 : 1 }}
            className={style.modal}
        >
            <div className={style.content}>{children}</div>
        </AntdModal>
    );
};

export default Modal;
