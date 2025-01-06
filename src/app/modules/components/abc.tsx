// import React, { useState } from "react";
// import { Button } from "@mui/material";
// import ReusableModal from "./ReusableModal";

// const App = () => {
//   const [open, setOpen] = useState(false);

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);

//   return (
//     <div>
//       <Button variant="contained" onClick={handleOpen}>
//         Open Modal
//       </Button>

//       <ReusableModal
//         open={open}
//         onClose={handleClose}
//         title="Reusable Modal Title"
//         actions={
//           <>
//             <Button
//               onClick={handleClose}
//               color="primary"
//               sx={{ marginRight: 2 }}
//             >
//               Close
//             </Button>
//             <Button onClick={handleClose} color="secondary">
//               Confirm
//             </Button>
//           </>
//         }
//       >
//         <p>This is some content that can be passed as children!</p>
//       </ReusableModal>
//     </div>
//   );
// };

// export default App;
