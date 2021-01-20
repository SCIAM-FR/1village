import Link from "next/link";
import { useSnackbar } from "notistack";
import React from "react";

import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

import { Modal } from "src/components/Modal";
import PelicoVacances from "src/svg/pelico/pelico_vacances.svg";
import { UserType } from "types/user.type";
import { Village } from "types/village.type";

import { UserContext } from "./userContext";

interface VillageContextValue {
  village: Village | null;
  showSelectVillageModal(): void;
}

export const VillageContext = React.createContext<VillageContextValue>(null);

interface VillageContextProviderProps {
  children: React.ReactNode;
}

export const VillageContextProvider: React.FC<VillageContextProviderProps> = ({ children }: VillageContextProviderProps) => {
  const { enqueueSnackbar } = useSnackbar();
  const { user, axiosLoggedRequest, logout } = React.useContext(UserContext);
  const [village, setVillage] = React.useState<Village | null>(null);
  const [villages, setVillages] = React.useState<Village[] | null>([]);
  const [selectedVillageIndex, setSelectedVillageIndex] = React.useState(-1);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [showUnassignedModal, setShowUnassignedModal] = React.useState(false);

  const getVillage = React.useCallback(
    async (villageId: number) => {
      const response = await axiosLoggedRequest({
        method: "GET",
        url: `/villages/${villageId}`,
      });
      if (response.error) {
        return null;
      }
      return response.data as Village;
    },
    [axiosLoggedRequest],
  );
  const getVillages = React.useCallback(async () => {
    const response = await axiosLoggedRequest({
      method: "GET",
      url: "/villages",
    });
    if (response.error) {
      return setVillages([]);
    }
    return setVillages(response.data as Village[]);
  }, [axiosLoggedRequest]);

  const hasFetchVillages = React.useRef(false);
  const showSelectVillageModal = React.useCallback(() => {
    if (hasFetchVillages.current === false) {
      hasFetchVillages.current = true;
      getVillages().catch();
    }
    setSelectedVillageIndex(-1);
    setIsModalOpen(true);
  }, [getVillages]);

  const setUserVillage = React.useCallback(async () => {
    let userVillage: Village | null = null;
    if (user !== null && user.villageId) {
      userVillage = await getVillage(user.villageId);
    }
    setVillage(userVillage);
    if (userVillage === null && user.type > UserType.TEACHER) {
      showSelectVillageModal();
    }
    if (userVillage === null && user.type === UserType.TEACHER) {
      setShowUnassignedModal(true);
    }
  }, [getVillage, showSelectVillageModal, user]);
  React.useEffect(() => {
    setUserVillage().catch();
  }, [setUserVillage]);

  const onAskVillage = () => {
    enqueueSnackbar("Votre demande d'assignation à un village a bien été envoyé à un administrateur !", {
      variant: "success",
    });
  };

  return (
    <VillageContext.Provider value={{ village, showSelectVillageModal }}>
      {children}
      <Modal
        open={isModalOpen}
        title="Sélectionner un village"
        confirmLabel="Choisir"
        fullWidth
        maxWidth="sm"
        ariaLabelledBy="selection-village"
        ariaDescribedBy="selection-village-desc"
        disabled={selectedVillageIndex === -1}
        noCloseButton={village === null}
        noCloseOutsideModal={village === null}
        noCancelButton
        onClose={() => {
          setIsModalOpen(false);
        }}
        onConfirm={() => {
          if (selectedVillageIndex !== -1) {
            setVillage(villages[selectedVillageIndex]);
          }
          setIsModalOpen(false);
        }}
      >
        {(villages || []).length === 0 ? (
          <>
            <p>Aucun village existe !</p>
            {user.type >= UserType.ADMIN ? (
              <Link href="/admin/villages">
                <Button component="a" href="/admin/villages" variant="contained" color="primary" size="small">
                  {"Créer un village sur l'interface admin"}
                </Button>
              </Link>
            ) : (
              <p>Demander un administrateur de créer les villages !</p>
            )}
          </>
        ) : (
          <>
            <FormControl variant="outlined" className="full-width">
              <InputLabel id="select-village">Village</InputLabel>
              <Select
                labelId="select-village"
                id="select-village-outlined"
                value={selectedVillageIndex === -1 ? "" : selectedVillageIndex}
                onChange={(event) => {
                  setSelectedVillageIndex(event.target.value as number);
                }}
                label="Village"
              >
                {(villages || []).map((v, index) => (
                  <MenuItem value={index} key={v.id}>
                    {v.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {village === null && user.type >= UserType.ADMIN && (
              <>
                <Divider style={{ margin: "1rem 0" }} />
                <Link href="/admin/villages">
                  <Button component="a" href="/admin/villages" variant="contained" color="primary" size="small">
                    {"Aller à l'interface admin"}
                  </Button>
                </Link>
              </>
            )}
          </>
        )}
      </Modal>
      <Modal
        open={showUnassignedModal}
        fullWidth
        maxWidth="sm"
        ariaLabelledBy="demande-village"
        ariaDescribedBy="demande-village-desc"
        noCloseButton={village === null}
        noCloseOutsideModal={village === null}
        noTitle
        cancelLabel="Se déconnecter"
        onClose={logout}
        id="village-demande-modal"
      >
        <div id="demande-village-desc" style={{ position: "relative" }}>
          <PelicoVacances style={{ height: "6rem", width: "6rem", position: "absolute", top: "-0.5rem", left: "-4rem" }} />
          <div style={{ width: "100%", padding: "1rem", textAlign: "center" }}>
            <h2>{"Mince, votre classe n'est pas dans un village !"}</h2>
            <Button variant="contained" color="primary" size="small" style={{ margin: "1rem" }} onClick={onAskVillage}>
              {"Demander à être assigné à un village"}
            </Button>
          </div>
        </div>
      </Modal>
    </VillageContext.Provider>
  );
};