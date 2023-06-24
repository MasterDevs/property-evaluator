import * as React from "react";
import { useAuth, useUser } from "@clerk/nextjs";

const MyProperties = () => {
  const { isLoaded, userId, sessionId, isSignedIn } = useAuth();
  const { user, isLoaded: userIsLoaded } = useUser();

  return (
    <div>
      <h1>Hello MyProperties</h1>
      {userIsLoaded ? (
        <div>
          <pre>
            <code>{JSON.stringify(user, null, 2)}</code>
          </pre>
        </div>
      ) : null}
      <pre>
        <code>
          {JSON.stringify({ isLoaded, userId, isSignedIn, sessionId }, null, 2)}
        </code>
      </pre>
    </div>
  );
};

export default MyProperties;
