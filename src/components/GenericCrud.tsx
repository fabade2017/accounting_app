// // src/components/GenericCrud.tsx
// src/components/GenericCrud.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { AntdInferencer } from "@refinedev/inferencer/antd";
import { List, Create, Edit, Show } from "@refinedev/antd";

export const GenericCrud = () => {
  const { resource, "*": splat } = useParams(); // ← THIS IS CORRECT
  const segments = (splat || "").split("/").filter(Boolean);
  const action = segments[0]; // create, edit, show
  const id = segments[1];     // only for edit/show

  if (!resource) {
    return (
      <div style={{ padding: 60, fontSize: 28, textAlign: "center", color: "#999" }}>
        ← Select a module from the sidebar
      </div>
    );
  }

  const title = resource
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());

  const isList = !action;
  const isCreate = action === "create";
  const isEdit = action === "edit";
  const isShow = action === "show" || (!!id && !isEdit && !isCreate);

  return (
    <>
      {isList && (
        <List title={title}>
          <AntdInferencer resource={resource} action="list" />
        </List>
      )}

      {isCreate && (
        <Create saveButtonProps={{ children: "Save" }}>
          <AntdInferencer resource={resource} action="create" />
        </Create>
      )}

      {isEdit && id && (
        <Edit saveButtonProps={{ children: "Save" }}>
          <AntdInferencer resource={resource} id={id} action="edit" />
        </Edit>
      )}

      {isShow && id && (
        <Show>
          <AntdInferencer resource={resource} id={id} action="show" />
        </Show>
      )}
    </>
  );
};

// import React from "react";
// import { useParams } from "react-router-dom";
// import { AntdInferencer } from "@refinedev/inferencer/antd";
// import { List, Create, Edit, Show } from "@refinedev/antd";

// export const GenericCrud = () => {
//   const params = useParams();
// console.log(params);
//   const wildcard = params["*"] || "";                  
//   const segments = wildcard.split("/").filter(Boolean); 

//   const resource = segments[0];                         
//   const action = segments[1];                           
//   const id = segments[2];                               

//   if (!resource) {
//     return (
//       <div style={{ padding: 40, fontSize: 24 }}>
//         Select a module from the sidebar
//       </div>
//     );
//   }

//   // Cleaner checks
//   const isList = !action;               
//   const isCreate = action === "create"; 
//   const isEdit = action === "edit";     
//   const isShow = action === "show";     

//   const title = resource
//     .replace(/-/g, " ")
//     .replace(/\b\w/g, (c) => c.toUpperCase());

//   return (
//     <>
//       {isList && (
//         <List title={title}>
//           <AntdInferencer resource={resource} action="list" />
//         </List>
//       )}

//       {isCreate && (
//         <Create saveButtonProps={{ children: "Save" }}>
//           <AntdInferencer resource={resource} action="create" />
//         </Create>
//       )}

//       {isEdit && id && (
//         <Edit saveButtonProps={{ children: "Save" }}>
//           <AntdInferencer resource={resource} id={id} action="edit" />
//         </Edit>
//       )}

//       {isShow && id && (
//         <Show>
//           <AntdInferencer resource={resource} id={id} action="show" />
//         </Show>
//       )}
//     </>
//   );
// };
