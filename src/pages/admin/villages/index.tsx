import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

import IconButton from "@material-ui/core/IconButton";
import MaterialLink from "@material-ui/core/Link";
import Tooltip from "@material-ui/core/Tooltip";
import { Button, NoSsr } from "@material-ui/core";
import AddCircleIcon from "@material-ui/icons/AddCircle";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";

import { Modal } from "src/components/Modal";
import { AdminTable } from "src/components/admin/AdminTable";
import { AdminTile } from "src/components/admin/AdminTile";
import { useCountries } from "src/services/useCountries";
import { useVillages, useVillageRequests } from "src/services/useVillages";
import { countryToFlag } from "src/utils";

const Villages: React.FC = () => {
  const router = useRouter();
  const { countries } = useCountries();
  const countryMap = countries.reduce<{ [key: string]: string }>((acc, country) => {
    acc[country.isoCode] = country.name;
    return acc;
  }, {});
  const { villages } = useVillages();
  const { deleteVillage } = useVillageRequests();
  const [deleteIndex, setDeleteIndex] = React.useState(-1);

  const countriesToText = (countries: string[]) => {
    return countries.map((isoCode) => `${countryToFlag(isoCode)} ${countryMap[isoCode.toUpperCase()] || ""}`).join(" - ");
  };

  const actions = (id: number, index: number) => (
    <>
      <Tooltip title="Modifier">
        <IconButton
          aria-label="edit"
          onClick={() => {
            router.push(`/admin/villages/edit/${id}`);
          }}
        >
          <EditIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Supprimer">
        <IconButton
          aria-label="delete"
          onClick={() => {
            setDeleteIndex(index);
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </>
  );

  return (
    <div className="admin--container">
      <Link href="/admin/villages">
        <MaterialLink href="/admin/villages">
          <h1 style={{ marginBottom: "1rem" }}>Villages</h1>
        </MaterialLink>
      </Link>
      <AdminTile
        title="Liste des villages"
        toolbarButton={
          <Link href="/admin/villages/new">
            <Button component="a" href="/admin/villages/new" variant="contained" style={{ flexShrink: 0 }} startIcon={<AddCircleIcon />}>
              Ajouter un village
            </Button>
          </Link>
        }
      >
        <AdminTable
          emptyPlaceholder={
            <>
              {"Vous n'avez pas encore de villages ! "}
              <Link href="/admin/villages/new">
                <a className="text text--primary text--small" href="/admin/villages/new">
                  En créer un ?
                </a>
              </Link>
            </>
          }
          data={villages.map((v) => ({
            ...v,
            countries: countriesToText(v.countries),
            userCount: 0,
            postCount: 0,
          }))}
          columns={[
            { key: "name", label: "Nom du village", sortable: true },
            { key: "countries", label: "Pays" },
            { key: "userCount", label: "Nombre de classes", sortable: true },
            { key: "postCount", label: "Nombre de posts", sortable: true },
          ]}
          actions={actions}
        />
      </AdminTile>
      <NoSsr>
        <Modal
          title="Confirmer la suppression"
          open={deleteIndex !== -1}
          onClose={() => {
            setDeleteIndex(-1);
          }}
          onConfirm={async () => {
            await deleteVillage(villages[deleteIndex]?.id || -1);
            setDeleteIndex(-1);
          }}
          fullWidth
          maxWidth="sm"
          ariaLabelledBy="delete-village-id"
          ariaDescribedBy="delete-village-desc"
          error
        >
          <div id="delete-village-desc">
            Voulez vous vraiment supprimer le village <strong>{villages[deleteIndex]?.name}</strong> ?
          </div>
        </Modal>
      </NoSsr>
    </div>
  );
};

export default Villages;