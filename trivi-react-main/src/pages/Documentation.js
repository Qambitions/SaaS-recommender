import React from "react";
import { TabTitle } from "../constants/generalFunctions";
import { Row , Container} from "@themesberg/react-bootstrap";
import { domainPath } from "../constants/utils";

export default () => {
  TabTitle("Documentation");
  const srcFile = domainPath + 'static/dimadb/pdf/user-guide.pdf';

  return (
    <article>
      <Container className="px-0" style={{height:'100vh'}}>
        <iframe
          src={srcFile}
          frameBorder="0"
          scrolling="auto"
          height="100%"
          width="100%"
        ></iframe>
      </Container>
    </article>
  );
};
